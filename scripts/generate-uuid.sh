# Generate n UUIDs to a file f
# Usage: ./generate-uuid.sh n f
# Example: ./generate-uuid.sh 10 uuids.txt

# Check if the number of arguments is correct
if [ "$#" -ne 2 ]; then
    echo "Usage: ./generate-uuid.sh n f"
    echo "Example: ./generate-uuid.sh 10 uuids.txt"
    exit 1
fi

# Check if the first argument is a number
if ! [[ "$1" =~ ^[0-9]+$ ]]; then
    echo "The first argument must be a number"
    exit 1
fi

# Clear the file if it exists
if [ -f "$2" ]; then
    # Clear the file
    echo "" > $2
fi

# Create directory if it doesn't exist
if [ ! -d "$(dirname $2)" ]; then
    mkdir -p $(dirname $2)
fi

# Generate n UUIDs and write them to a file
for i in $(seq 1 $1); do
    uuidgen >> $2
done

echo "UUIDs generated and saved to $2"
