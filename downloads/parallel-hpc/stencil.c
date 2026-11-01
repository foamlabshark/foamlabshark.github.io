/* Teaching supplement, not a book listing or complete physical model.
 * GCC with OpenMP: gcc -std=c11 -O2 -fopenmp stencil.c -o stencil
 * old and next must be non-overlapping arrays.
 * Only interior values are updated; caller supplies boundary values.
 * Not compiled or run in the authoring environment.
 */
#include <stdio.h>
#define NX 6
#define NY 6

void step(const double old[NY][NX], double next[NY][NX]) {
    #pragma omp parallel for
    for (int j = 1; j < NY - 1; ++j) {
        #pragma omp simd
        for (int i = 1; i < NX - 1; ++i) {
            next[j][i] = (old[j][i-1]
                + old[j-1][i] + old[j][i]
                + old[j][i+1] + old[j+1][i]) / 5.0;
        }
    }
}

int main(void) {
    double old[NY][NX] = {{0.0}};
    double next[NY][NX] = {{0.0}};
    old[2][2] = 10.0;
    step((const double (*)[NX])old, next);
    /* In C before C23 the explicit cast avoids nested array qualifier issues. */
    for (int j = 0; j < NY; ++j) {
        for (int i = 0; i < NX; ++i) {
            printf("%.1f%s", next[j][i], i == NX - 1 ? "\n" : " ");
        }
    }
    return 0;
}
