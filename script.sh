find backend frontend \
  \( -path "*/migrations/*" -o -path "*/Migrations/*" -o -path "*/dist/*" -o -path "*/.angular/*" -o -path "*/obj/*" -o -path "*/public/*" -o -path "*/node_modules/*" -o -path "*/bin/*" \) -prune -o \
  \( ! -name "taskmanagement.db" -a ! -name "package-lock.json" -type f -print \) \
  | while read file; do
      echo -e "\n===== FILE: $file =====\n" >> project.txt
      cat "$file" >> project.txt
    done
