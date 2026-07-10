import re

with open('/Users/naufalrasydan/Documents/Workspace/Intern BRI/Syncore/frontend/src/components/RkaFormModal.tsx', 'r') as f:
    content = f.read()

# 1. Add useEffect import
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

# 2. Update MONTHS constant to include SHORT version if not there, wait let's just replace the whole file because it's easier and cleaner.
