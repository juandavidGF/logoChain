// https://cloud.google.com/domains/docs/reference/rest

from google.cloud import domains_v1beta1

client = domains_v1beta1.DomainsServiceClient()

project_id = "your-project-id"
location = "us-central1"
query_input = domains_v1beta1.SearchDomainsRequest.QueryInput(
    query="example.com"
)
scope = domains_v1beta1.SearchDomainsRequest.Scope(
    include_registered_domains=False
)
response = client.search_domains(
    location=f"projects/{project_id}/locations/{location}",
    query_input=query_input,
    scope=scope,
)

for result in response.registered_domains:
    print(f"Registered domain: {result.domain_name}")
for result in response.registered_domains:
    print(f"Available domain: {result.domain_name}")


// ChatGPT suggestion

from google.oauth2 import service_account
from googleapiclient.discovery import build

# Set up the credentials to authenticate the API request
credentials = service_account.Credentials.from_service_account_file(
    'path/to/your/service_account.json'
)

# Create a Google Domains API client
domains_api = build('domains', 'v1beta1', credentials=credentials)

# Search for an available domain name
response = domains_api.domains().search(body={
    'queryInput': {
        'domainNameQueryOptions': {
            'domainName': 'example.com'
        }
    }
}).execute()

# Print the search results
print(response)
