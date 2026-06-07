const TINYBIRD_ADMIN_TOKEN = process.env.TINYBIRD_TOKEN;
const TINYBIRD_API_URL = process.env.TINYBIRD_URL;

export const processDelete = async (event) => {
  const { websiteId } = event;

  if (!websiteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required string parameter: websiteId",
      }),
    };
  }

  try {
    console.log(
      `Initiating Tinybird lifecycle data purge sequence for websiteId: ${websiteId}`,
    );

    const datasourceName = "incoming_events";
    const endpoint = `${TINYBIRD_API_URL}/v0/datasources/${datasourceName}/delete`;

    const params = new URLSearchParams();
    params.append("delete_condition", `websiteId = '${websiteId}'`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TINYBIRD_ADMIN_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Tinybird API response failure [${response.status}]: ${errorText}`,
      );
    }

    const result = await response.json();
    console.log(
      `Purge successfully queued inside ClickHouse engine logs. Job metadata:`,
      result,
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Purge condition successfully registered for project rows matching websiteId ${websiteId}`,
        job_id: result.job_id,
      }),
    };
  } catch (error) {
    console.error(
      "Fatal exception during serverless data scrubbing execution pass:",
      error,
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message || "Internal Telemetry Deletion Failure",
      }),
    };
  }
};
