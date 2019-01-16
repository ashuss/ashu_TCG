import boto3

dynamodb_client = boto3.client('dynamodb',aws_access_key_id='AKIAJGO4OQ46NESIYA4Q',aws_secret_access_key='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',region_name='eu-west-1',endpoint_url="https://dynamodb.eu-west-1.amazonaws.com")


table_name = 'Fsm_table'
existing_tables = dynamodb_client.list_tables()['TableNames']