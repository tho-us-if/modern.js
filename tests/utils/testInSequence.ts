export class SequenceWait {
  // sequenceList: Promise<any>[] = [];
  sequenceList: Map<string, Promise<any>> = new Map();

  // sequenceResolveList: Array<(value: unknown) => void> = [];
  sequenceResolveList: Map<string, (value: unknown) => void> = new Map();

  add(key: string) {
    const newPromise = new Promise(resolve => {
      // this.sequenceResolveList[this.sequenceIndex] = resolve;
      this.sequenceResolveList.set(key, resolve);
    });
    // this.sequenceList[this.sequenceIndex] = newPromise;
    this.sequenceList.set(key, newPromise);
  }

  async waitUntil(waitIndex: string) {
    // await Promise.all([this.sequenceList[waitIndex]]);
    await Promise.all([this.sequenceList.get(waitIndex)]);
    // wait for some time
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async done(waitIndex: string) {
    const targetResolve = this.sequenceResolveList.get(waitIndex);
    if (targetResolve) {
      targetResolve(null);
    }
  }
}
