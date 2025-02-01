import { parse } from 'csv-parse/sync';

type Output = {
  subject: string;
  to: string;
  name: string;
  registerURL: string;
  userID: string;
};

type RegistrationResponse = { user_id: string; registration_token: string };

console.log(
  `Please ensure the registration info includes the following fields, in any order:
name,email,role\n
Additionally, please ensure the CSV file is in the same directory as this script.\n`
);
const path =
  prompt(
    'Please enter the filename of the CSV relative to your directory (default: users.csv):\n'
  ) ?? 'users.csv';
const url =
  prompt('Please enter the base API url (default http://localhost:3000):\n') ??
  'http://localhost:3000';
const god_cookie = prompt('Please copy paste your god cookie here:');

const content = await Bun.file(path).text();

// bom = byte order mark for utf-8 files
const records: any[] = parse(content, { bom: true, trim: true, columns: true });

const output: Output[] = [];
const outputFileWriter = Bun.file('output.csv').writer();
outputFileWriter.write('subject,to,name,registerURL,userID\n');

const flushOutput = () => {
  for (const line of output) {
    outputFileWriter.write(
      `${line.subject},${line.to},${line.name},${line.registerURL},${line.userID}\n`
    );
  }
};

for (const i in records) {
  const record = records[i];

  const name = record.name;
  const firstName = name.split(' ')[0];
  const email = record.email;
  const role = record.role;

  const data = {
    name: name,
    email: email,
    role: role
  };

  // Create user
  const resp = await fetch(`${url}/api/auth/create`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_session=${god_cookie}`
    }
  });

  if (!resp.ok) {
    console.error(
      `Failed at user ${name} (${i}/${records.length}): ${await resp.text()} (${resp.status})`
    );
    flushOutput();
    process.exit(-1);
  }

  const json: RegistrationResponse = await resp.json();

  output.push({
    subject: `${firstName}: Register for our IC Hack 2025 platform now! (Required)`,
    to: email,
    name: name,
    registerURL: `https://my.ichack.org/register?token=${json.registration_token}`,
    userID: json.user_id
  });
}

flushOutput();
