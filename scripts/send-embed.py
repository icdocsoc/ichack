# This script is used to create an embed message for the bot

from datetime import datetime
import json
import argparse
from urllib.parse import urlparse
import requests
import os

def is_valid_url(url):
  try:
    result = urlparse(url)
    return all([result.scheme, result.netloc])
  except:
    return False

def get_json_embed(url):
  if not is_valid_url(url):
    raise ValueError("The URL is not valid")

  username = "Cloudflare Pages"
  avatar_url = "https://www.cloudflare.com/favicon.ico"
  title = "Successful deployment to staging"   
  description = "The deployment to staging was successful. Please check the website for any issues."
  timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

  file_content = {
    "username": username,
    "avatar_url": avatar_url,
    "embeds": [{
      "title": title,
      "url": url,
      "description": description,
      "timestamp": timestamp,
      "color": 24806
    }]
  }

  return json.dumps(file_content)
  
def send_message(embed_content):
  # get the webhook URL from the environment variables
  webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
  if not webhook_url:
    raise ValueError("The DISCORD_WEBHOOK_URL environment variable is not set")
  
  headers = {
    "Content-Type": "application/json"
  }

  response = requests.post(webhook_url, headers=headers, data=embed_content)
  if response.status_code != 204:
    raise Exception(f"Failed to send the message. Status code: {response.status_code}")

if __name__ == '__main__':
  parser = argparse.ArgumentParser(description='Create an embed message for the bot')
  parser.add_argument('--url', type=str, help='The URL of the deployment', required=True)

  args = parser.parse_args()
  url = args.url

  embed_content = get_json_embed(url)
  send_message(embed_content)