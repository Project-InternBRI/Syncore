from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
import shutil
import os
import uuid
import json
import io

try:
    import orjson  # 10-100x faster than stdlib json
    HAS_ORJSON = True
except ImportError:
    HAS_ORJSON = False

from app.services.processor import process_files
from app.services.exporter import export_to_excel
from app.services.exporter_uker import export_uker_to_excel
from app.services.exporter_produk import export_monitoring_produk_to_excel
from app.services.pdf_exporter import export_dashboard_pdf
import traceback
import sys


app = FastAPI(
    title="SYNCORE Excel Service",
    description="Service for reading, validating, and generating Excel files for SYNCORE",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to SYNCORE Excel Service API"}

@app.post("/api/process")
async def process_ssa(
    file_simpanan: UploadFile = File(...),
    file_pinjaman: UploadFile = File(...),
    file_simpanan_hist: Optional[UploadFile] = File(None),
    file_pinjaman_hist: Optional[UploadFile] = File(None)
):
    temp_dir = f"/tmp/syncore_{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        def save_file(upload_file: UploadFile) -> str:
            if not upload_file:
                return None
            path = os.path.join(temp_dir, upload_file.filename)
            with open(path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
            return path

        path_simp = save_file(file_simpanan)
        path_pinj = save_file(file_pinjaman)
        path_simp_hist = save_file(file_simpanan_hist)
        path_pinj_hist = save_file(file_pinjaman_hist)

        simp_hist_list = [path_simp_hist] if path_simp_hist else []
        pinj_hist_list = [path_pinj_hist] if path_pinj_hist else []

        print("Starting process_files...")
        data_dict = process_files(
            path_simpanan_berjalan=path_simp,
            path_pinjaman_berjalan=path_pinj,
            path_simpanan_historis=simp_hist_list,
            path_pinjaman_historis=pinj_hist_list
        )
        print("process_files completed.")
        
        # Serialize to temp file — orjson is 10-100x faster than stdlib json
        import tempfile
        tmp_fd, out_path = tempfile.mkstemp(suffix='.json', prefix='processed_data_')
        with os.fdopen(tmp_fd, 'wb') as f:
            if HAS_ORJSON:
                f.write(orjson.dumps(data_dict))
            else:
                f.write(json.dumps(data_dict, default=str).encode('utf-8'))
        print(f"Serialization complete: {out_path}")
            
        stats = data_dict.get('__stats__', {})
        # Only send lightweight metadata over HTTP (not the full uker/row data)
        metadata_total = {
            'periode_list': data_dict.get('Total AH Gunsar', {}).get('periode_list', []),
            'rows': data_dict.get('Total AH Gunsar', {}).get('rows', [])[:5],  # only first 5 rows for period detection
        }
        
        return {
            "success": True, 
            "data_file": out_path,
            "stats": stats,
            "metadata": {"Total AH Gunsar": metadata_total}
        }


    except Exception as e:
        error_msg = traceback.format_exc()
        print(f"Error in process_ssa: {error_msg}")
        with open('/tmp/fastapi_error.log', 'a') as f:
            f.write(error_msg + '\n')
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


@app.post("/api/export/{dashboard_type}")
async def export_dashboard(dashboard_type: str, payload: dict):
    # payload is the massive JSON snapshot
    data_dict = payload.get('data')
    if not data_dict:
        raise HTTPException(status_code=400, detail="Missing data field in payload")

    output = io.BytesIO()

    try:
        if dashboard_type == 'kc':
            # KC Dashboard includes all KC logic from main exporter (but filtered to KCs)
            # wait, the exporter exports EVERYTHING if we pass it normally. 
            # We can use export_to_excel(data_dict, file_path) but it writes to disk.
            # We'll write to a temp file and return as stream.
            pass
        elif dashboard_type == 'kcp':
            pass
        elif dashboard_type == 'unit':
            pass
        elif dashboard_type in ('produk', 'monitoring_produk'):
            pass
            
        # Write to temp file
        temp_path = f"/tmp/export_{uuid.uuid4()}.xlsx"
        if dashboard_type == 'kc':
            export_to_excel(data_dict, temp_path)
        elif dashboard_type == 'kcp':
            uker_data = data_dict.get('__uker_data__', data_dict)
            # Inject __rka__ from parent data_dict so KCP exporter can use it
            if '__rka__' not in uker_data and '__rka__' in data_dict:
                uker_data = dict(uker_data)  # shallow copy to avoid mutating snapshot
                uker_data['__rka__'] = data_dict['__rka__']
            export_uker_to_excel(uker_data, temp_path, 'KCP')
        elif dashboard_type == 'unit':
            uker_data = data_dict.get('__uker_data__', data_dict)
            # Inject __rka__ from parent data_dict so Unit exporter can use it
            if '__rka__' not in uker_data and '__rka__' in data_dict:
                uker_data = dict(uker_data)  # shallow copy to avoid mutating snapshot
                uker_data['__rka__'] = data_dict['__rka__']
            export_uker_to_excel(uker_data, temp_path, 'Unit')
        elif dashboard_type in ('produk', 'monitoring_produk'):
            export_monitoring_produk_to_excel(data_dict, temp_path)
        else:
            export_to_excel(data_dict, temp_path)

        def iterfile():
            with open(temp_path, mode="rb") as file_like:
                yield from file_like
            os.remove(temp_path)

        return StreamingResponse(iterfile(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except Exception as e:
        error_msg = traceback.format_exc()
        safe_msg = error_msg.encode('ascii', 'replace').decode('ascii')
        print(f"Error in export_dashboard: {safe_msg}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export-pdf/{dashboard_type}")
async def export_dashboard_pdf_endpoint(dashboard_type: str, payload: dict):
    data_dict = payload.get('data')
    period_name = payload.get('period_name', 'Periode Berjalan')
    selected_periods = payload.get('selected_periods', [])
    selected_components = payload.get('selected_components', [])
    selected_rka = payload.get('selected_rka', [])
    if not data_dict:
        raise HTTPException(status_code=400, detail="Missing data field in payload")

    try:
        pdf_bytes = export_dashboard_pdf(data_dict, dashboard_type, period_name, selected_periods, selected_components, selected_rka)
        def iterfile():
            yield pdf_bytes
            
        return StreamingResponse(iterfile(), media_type="application/pdf")
    except Exception as e:
        error_msg = traceback.format_exc()
        print(f"Error in export_pdf: {error_msg}")
        with open("pdf_error.log", "w") as f:
            f.write(error_msg)
        raise HTTPException(status_code=500, detail=str(e))



