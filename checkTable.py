import boto3
client = boto3.resource('dynamodb',aws_access_key_id='AKIAJGO4OQ46NESIYA4Q',aws_secret_access_key='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',region_name='eu-west-1')
print('client',client)
table = client.Table('Fsm_table')
dynamodb_client = boto3.client('dynamodb',aws_access_key_id='AKIAJGO4OQ46NESIYA4Q',aws_secret_access_key='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',region_name='eu-west-1')
timestamp="1547212124139"
table_name = 'Fsm_table'
existing_tables = dynamodb_client.list_tables()[table_name]
response = table.query(
    KeyConditionExpression=Key('timestamp').eq(timestamp)
)
"""
for i in response['Items']:
    print(i['year'], ":", i['title'])
response = table.get_item(
key = {'timestamp':timepstamp})


rpm=response['Item']['rpm']
"""
