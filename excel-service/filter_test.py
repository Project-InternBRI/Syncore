import json

def apply_filters(data_dict, selected_periods, selected_components):
    if not selected_periods and not selected_components:
        return data_dict

    filtered_dict = {}
    for kc, kc_data in data_dict.items():
        if kc.startswith('__'):
            filtered_dict[kc] = kc_data
            continue
            
        if not isinstance(kc_data, dict) or 'rows' not in kc_data:
            filtered_dict[kc] = kc_data
            continue

        new_rows = []
        for r in kc_data.get('rows', []):
            label = r.get('label', '')
            # Filter by components if provided
            if selected_components and label not in selected_components:
                continue
                
            # Filter by periods if provided
            if selected_periods and 'values' in r:
                new_vals = {k: v for k, v in r['values'].items() if k in selected_periods}
                r['values'] = new_vals
                
            new_rows.append(r)
            
        new_kc_data = dict(kc_data)
        new_kc_data['rows'] = new_rows
        
        if selected_periods and 'periode_list' in new_kc_data:
            new_kc_data['periode_list'] = [p for p in new_kc_data['periode_list'] if p in selected_periods]
            
        filtered_dict[kc] = new_kc_data
        
    return filtered_dict
