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
        
        table_entry = {
            "metadata": metadata,
            "data": result
        }

        if query_name.startswith("incidents_by_"):
            group_key = query_name.replace("incidents_by_", "")
            if "by_" in group_key:
                keys = group_key.split("_by_")
                table_entry["data"] = self.transform_to_nested_format(
                    result, 
                    keys[-1],
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

# Define all queries
queries = {
    "total_incidents": "SELECT COUNT(*) FROM incident_data",
    "incidents_caused_by_change": "SELECT COUNT(*) FROM incident_data WHERE caused_by IS NOT NULL AND caused_by <> ''",
    "incidents_with_mcis": "SELECT COUNT(*) FROM incident_data WHERE major_incident_state = 'accepted'",
    "incidents_with_problems": "SELECT COUNT(*) FROM incident_data WHERE problem_id IS NOT NULL AND caused_by <> ''",
    "incidents_by_major_incident_state": """
        SELECT 
            major_incident_state,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                major_incident_state,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
            WHERE major_incident_state IS NOT NULL AND major_incident_state <> ''
        ) subquery
        GROUP BY major_incident_state, month_year
        ORDER BY major_incident_state, TO_DATE(month_year, 'MM/YYYY')
    """,
    "incidents_by_state": """
        SELECT 
            incident_state,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                incident_state,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
        ) subquery
        GROUP BY incident_state, month_year
        ORDER BY incident_state, TO_DATE(month_year, 'MM/YYYY')
    """,
    "incidents_by_made_sla": """
        SELECT 
            made_sla,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                made_sla,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
        ) subquery
        GROUP BY made_sla, month_year
        ORDER BY made_sla, TO_DATE(month_year, 'MM/YYYY')
    """,
    "incidents_by_portfolio": """
        SELECT 
            portfolio,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                portfolio,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
        ) subquery
        GROUP BY portfolio, month_year
        ORDER BY portfolio, TO_DATE(month_year, 'MM/YYYY')
    """,
    "incidents_by_severity": """
        SELECT 
            severity,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                severity,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
        ) subquery
        GROUP BY severity, month_year
        ORDER BY severity, TO_DATE(month_year, 'MM/YYYY')
    """,
    "incidents_by_priority": """
        SELECT 
            priority,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                priority,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
        ) subquery
        GROUP BY priority, month_year
        ORDER BY priority, TO_DATE(month_year, 'MM/YYYY')
    """,
    "enterprise": """
        SELECT TO_CHAR(sys_created_on, 'MM/YYYY') as month_year, COUNT(*)
        FROM incident_data
        GROUP BY TO_CHAR(sys_created_on, 'MM/YYYY')
        ORDER BY TO_DATE(TO_CHAR(sys_created_on, 'MM/YYYY'), 'MM/YYYY')
    """,
    "enterprise_caused_by": """
        SELECT TO_CHAR(sys_created_on, 'MM/YYYY') as month_year, COUNT(*)
        FROM incident_data
        WHERE caused_by IS NOT NULL AND caused_by <> ''
        GROUP BY TO_CHAR(sys_created_on, 'MM/YYYY')
        ORDER BY TO_DATE(TO_CHAR(sys_created_on, 'MM/YYYY'), 'MM/YYYY')
    """,
    "enterprise_mcis": """
        SELECT TO_CHAR(sys_created_on, 'MM/YYYY') as month_year, COUNT(*)
        FROM incident_data
        WHERE major_incident_state = 'accepted'
        GROUP BY TO_CHAR(sys_created_on, 'MM/YYYY')
        ORDER BY TO_DATE(TO_CHAR(sys_created_on, 'MM/YYYY'), 'MM/YYYY')
    """,
    "enterprise_problems": """
        SELECT TO_CHAR(sys_created_on, 'MM/YYYY') as month_year, COUNT(*)
        FROM incident_data
        WHERE problem_id IS NOT NULL AND caused_by <> ''
        GROUP BY TO_CHAR(sys_created_on, 'MM/YYYY')
        ORDER BY TO_DATE(TO_CHAR(sys_created_on, 'MM/YYYY'), 'MM/YYYY')
    """,
    "incidents_by_major_incident_state_by_portfolio": """
        SELECT 
            portfolio,
            major_incident_state,
            month_year,
            COUNT(*) as count
        FROM (
            SELECT 
                portfolio,
                major_incident_state,
                TO_CHAR(sys_created_on, 'MM/YYYY') as month_year
            FROM incident_data
            WHERE major_incident_state IS NOT NULL AND major_incident_state <> ''
        ) subquery
        GROUP BY portfolio, major_incident_state, month_year
        ORDER BY portfolio, major_incident_state, TO_DATE(month_year, 'MM/YYYY')
    """
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
