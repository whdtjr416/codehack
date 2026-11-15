// Server-only answer keys. Never import from a client component.
import "server-only";
export const answers: Record<string,string> = {encoding:"flag{first_step_ctf}",headers:"flag{read_the_headers}",ownership:"flag{authorization}",logs:"flag{alice}",xor:"flag{xor_is_reversible}",reverse:"flag{secure}"};

Object.assign(answers,{
  "permissions": "flag{640}",
  "signature": "flag{png}",
  "rot13": "flag{rot13_is_not_encryption}",
  "subnet": "flag{192.0.2.0}",
  "branches": "flag{42}",
  "audit": "flag{103}"
});
