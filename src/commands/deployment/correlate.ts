import {Command} from 'clipanion'

import { getCISpanTags } from '../../helpers/ci';
import { getGitMetadata } from '../../helpers/git/format-git-span-data';

export class DeploymentCorrelateCommand extends Command {
  public static paths = [['deployment', 'correlate']]

  public static usage = Command.Usage({
    category: 'CI Visibility',
    description: 'Correlate CI and CD.',
    details: `
      This command will correlate
    `,
  })

  public async execute() {
    console.log('Git commands: ');
    console.log(await getGitMetadata());
    console.log('===========================');
    console.log('Env variables: ');
    console.log(getCISpanTags());
  }
}
