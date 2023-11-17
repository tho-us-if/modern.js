import { SequenceWait } from '../../../utils/testInSequence';

export const curSequence = new SequenceWait();

curSequence.add('test-dev');
curSequence.add('test-build');
curSequence.add('test-rem');

// export const sequence = curSequence;
