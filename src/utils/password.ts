import md5 from "md5";

export function encryptPassword(
  password: string,
  salt: string = "tinca-salt"
): string {
  return md5(salt + password.split("").reverse().join("") + salt);
}
