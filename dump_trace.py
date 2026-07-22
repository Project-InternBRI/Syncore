import sys, traceback
for thread_id, frame in sys._current_frames().items():
    print(f"Thread ID: {thread_id}")
    traceback.print_stack(frame)
    print()
