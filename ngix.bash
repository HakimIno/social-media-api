docker exec -it phayu /bin/bash

nginx -g 'daemon off;' & bun run dev

bun prisma generate