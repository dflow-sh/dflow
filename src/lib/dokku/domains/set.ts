import { NodeSSH } from 'node-ssh';

export const set = async (ssh: NodeSSH, name: string, domainName: string) => {
  const resultSetDomain = await ssh.execCommand(
    `dokku domains:set ${name} ${domainName}`,
  );

  if (resultSetDomain.code === 1) {
    throw new Error(resultSetDomain.stderr);
  }
};
