const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    try {
        console.log('Event received:', JSON.stringify(event, null, 2));
        
        const command = new GetParameterCommand({
            Name: process.env.SSM_PARAMETER_NAME || '/app/config/greeting',
            WithDecryption: false
        });
        
        const result = await ssmClient.send(command);
        const greeting = result.Parameter.Value;
        
        console.log("Retrieved from SSM:", greeting);
        
        return {
            statusCode: 200,
            status: "Success",
            greeting: greeting,
            timestamp: new Date().toISOString(),
            event: event
        };
    } catch (error) {
        console.error("Error retrieving SSM parameter:", error);
        return {
            statusCode: 500,
            status: "Error",
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};
