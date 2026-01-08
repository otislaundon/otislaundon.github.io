#!/usr/bin/bash
echo "Compiling html"
typst c --features html --format html main.typ
echo "Compiling PDF"
typst c --features html --format pdf main.typ