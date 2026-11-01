/* Teaching supplement to Chapter 1; not a listing from the book.
 * GCC with OpenMP: gcc -O2 -fopenmp vector_add.c -o vector_add
 * Expected: sum = 84.0
 * Not compiled or run in the authoring environment.
 */
#include <stdio.h>

int main(void) {
    enum { N = 8 };
    double a[N], b[N], c[N];
    for (int i = 0; i < N; ++i) {
        a[i] = i;
        b[i] = 2.0 * i;
    }
    #pragma omp parallel for simd
    for (int i = 0; i < N; ++i) {
        c[i] = a[i] + b[i];
    }
    double sum = 0.0;
    #pragma omp parallel for reduction(+:sum)
    for (int i = 0; i < N; ++i) {
        sum += c[i];
    }
    printf("sum = %.1f\n", sum);
    return 0;
}
