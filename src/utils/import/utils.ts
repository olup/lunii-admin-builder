export class UnsuportedPackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsuportedPackError";
  }
}
