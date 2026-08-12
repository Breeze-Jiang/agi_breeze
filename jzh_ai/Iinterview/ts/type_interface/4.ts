interface AddFn {
  (a: number, b: number): number;
}
const add1: AddFn = (a, b) => a + b;
add1(1, 2);
type AddType = (a: number, b: number) => number;
