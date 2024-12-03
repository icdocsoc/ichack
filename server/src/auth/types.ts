/** The password pattern is as follows:
 * 1. At least 8 characters long
 * 2. At least one uppercase letter
 * 3. At least one lowercase letter
 * 4. At least one number
 */
export const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/;
