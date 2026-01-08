# to create sketch [NAME]:

# create folder /sketches/[NAME]
# create file /sketch/[NAME]/[NAME].js
# set file contents of created file with name in place
# create file /sketches/[NAME]/[NAME].png

if [ -d "./sketches/$1" ]; then
    echo "sketch already exists, proceed?"
    read PROCEED
    echo $PROCEED
    if [ ! $PROCEED = "y" ]; then
        exit
    fi
    echo "creating sketch $1"
fi

mkdir -p ./sketches/$1
cp ./sketches/template/sketch-template.js ./sketches/$1/$1.js
sed -i s/SKETCH_NAME/$1/g ./sketches/$1/$1.js