#!/bin/sh

set -e

./configure --prefix=$PREFIX --with-libtiff=$PREFIX

make --no-print-directory
make install
