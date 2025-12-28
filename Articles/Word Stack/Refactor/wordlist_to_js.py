print("hello")

source = open("word-list.txt")

with open("word-list.js", "w") as dest:
    dest.write("wordlist = [\n")
    n = 0
    for line in source.readlines():
        dest.write("\"" + line.strip() + "\",\n")
        n += 1
    dest.write("];")