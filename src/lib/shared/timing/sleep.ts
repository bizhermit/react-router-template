export default async function sleep(time: number) {
  return new Promise<void>(r => setTimeout(r, time));
};
