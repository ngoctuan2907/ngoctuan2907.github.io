import os

def extract_all_file_contents(root_dir, output_file='output-files-contents-from-hooks.txt'):
    with open(output_file, 'w', encoding='utf-8') as out_f:
        for foldername, subfolders, filenames in os.walk(root_dir):
            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as in_f:
                        contents = in_f.read()
                except Exception as e:
                    contents = f"[Error reading file: {e}]"
                
                out_f.write(f"--- FILE: {file_path} ---\n")
                out_f.write(contents)
                out_f.write("\n\n")

    print(f"[✓] Completed. Contents saved to: {output_file}")

# 📌 Example usage
if __name__ == "__main__":
    root_path = "/media/ngoc/mydisk/master-program/program-modules/nttmarket/codes/ngoctuan2907.github.io/hooks"  # <- 🔁 Change this to your path
    extract_all_file_contents(root_path)
