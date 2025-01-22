import psycopg2
import json
import sys
import decimal
from typing import Dict, List, Any

# Database connection setup
password = sys.argv[1]
conn_string = f"postgresql://postgres:{password}@localhost:5432/postgres"
conn = psycopg2.connect(conn_string)
cur = conn.cursor()

class DataProcessor:
    def __init__(self):
        self.table_data = {}
        
    def query_to_json(self, query: str) -> List[Dict[str, Any]]:
        cur.execute(query)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        return [dict(zip(columns, row)) for row in rows]

    def convert_decimal_to_float(self, result: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if isinstance(result, list):
            for item in result:
                for key, value in item.items():
                    if isinstance(value, decimal.Decimal):
                        item[key] = float(value)
        return result

    def transform_to_nested_format(self, data: List[Dict[str, Any]], group_key: str, 
                                 date_key: str, count_key: str) -> Dict[str, List[Dict[str, Any]]]:
        transformed_data = {}
        for row in data:
            group_value = row[group_key]
            month_year = row[date_key]
            count = row[count_key]

            if group_value not in transformed_data:
                transformed_data[group_value] = []

            transformed_data[group_value].append({
                "month_year": month_year,
                "count": count
            })
        return transformed_data

    def process_query(self, query_name: str, query: str, metadata: Dict[str, str]) -> Dict[str, Any]:
        result = self.query_to_json(query)
        result = self.convert_decimal_to_float(result)
        
        # Common structure for all table data
        table_entry = {
            "metadata": metadata,
            "data": result
        }

        if query_name.startswith("incidents_by_"):
            # Extract the grouping key from the query name
            group_key = query_name.replace("incidents_by_", "")
            if "by_" in group_key:
                # Handle nested grouping
                keys = group_key.split("_by_")
                table_entry["data"] = self.transform_to_nested_format(
                    result, 
                    keys[-1],  # Use the last key as the grouping key
                    "month_year", 
                    "count"
                )
            else:
                table_entry["data"] = self.transform_to_nested_format(
                    result,
                    group_key,
                    "month_year",
                    "count"
                )
        
        return table_entry

    def process_all_queries(self, queries: Dict[str, str]) -> Dict[str, Any]:
        for query_name, query in queries.items():
            print(f"Processing query: {query_name}")
            
            metadata = {
                "query_name": query_name,
                "timestamp": "CURRENT_TIMESTAMP",
                "type": "incident_data"
            }
            
            self.table_data[query_name] = self.process_query(query_name, query, metadata)
            
        return self.table_data

# Define queries (keeping your existing queries dictionary)
queries = {
    # ... keep existing code (your queries dictionary)
}

# Process all queries and save results
processor = DataProcessor()
all_results = processor.process_all_queries(queries)

# Write results to file
with open("snow_incident_aggregated_results.json", 'w') as f:
    json.dump(all_results, f, indent=4)

# Close database connection
cur.close()
conn.close()

print("Queries executed and results saved to snow_incident_aggregated_results.json.")