# OF_material v2512 selected source cases

Source: the user's OF_material collection, adapted from Wolf Dynamics OpenFOAM training examples.
The archive includes selected initialisation / boundary / Laplace / cavity examples and the small external Fluent mesh required by the elbow case. Original file headers and attribution are retained.

The parent directory hierarchy is intentional: the elbow run script uses ../../../meshes_and_geometries. Keep it when extracting.
Compiled binaries, solution time directories, postProcessing, processor directories and generated polyMesh files are excluded. Run scripts may clean old results: work on a disposable copy and read the scripts first.

Version: OpenCFD OpenFOAM v2512. The original project notes report migration checks; this web distribution does not represent a new full-duration validation of every selected case. See the enclosed migration reports and the website's precise scope statement. Source compatibility and physical validation are distinct.

The original basic training materials are attributed to Wolf Dynamics; their slides identify CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Individual C++ files retain their original GPL notices and apply GPL-3.0-or-later where specified; a GPL licence copy is included. The distribution does not relicense third-party code. FoamLab's additions consist of the source-only packaging, index and explanatory documentation.

Typical use: load /usr/lib/openfoam/openfoam2512/etc/bashrc (adjust to local installation), enter a selected case, inspect run_solver.sh, then execute bash run_solver.sh. Custom Laplace applications must first be built with wmake from their application directories. Some examples use four MPI ranks and gnuplot.
