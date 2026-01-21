#!/usr/bin/bash
echo "Compiling html"
typst w  --format html --features html --no-serve main.typ &
echo "Compiling PDF"
typst w --format pdf --features html --no-serve main.typ &