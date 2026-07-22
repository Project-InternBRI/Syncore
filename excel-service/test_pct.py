import json

# Read snapshot data from database using artisan tinker
# Since we just generated, we can fetch the latest snapshot
from app.Models import GenerateSnapshot
snap = GenerateSnapshot.orderBy('id', 'desc').first()
print("SML % in snapshot:")
print(json.dumps(snap.snapshot_data['Tanah Abang'], indent=2)[:500])
