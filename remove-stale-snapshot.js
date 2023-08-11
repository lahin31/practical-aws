// a lambda function to delete unused EBS Snapshots

const AWS = require("aws-sdk");
const ec2 = new AWS.EC2();

exports.handler = async (event, context) => {
  try {
    const retentionDays = 30; // Define your retention period in days
    const now = new Date();

    const describeSnapshotsParams = {
      Filters: [
        { Name: "status", Values: ["completed"] }, // Consider only completed snapshots
      ],
    };

    const snapshots = await ec2
      .describeSnapshots(describeSnapshotsParams)
      .promise();

    for (const snapshot of snapshots.Snapshots) {
      const snapshotAge = Math.floor(
        (now - snapshot.StartTime) / (24 * 60 * 60 * 1000)
      );

      if (snapshotAge >= retentionDays) {
        const deleteSnapshotParams = {
          SnapshotId: snapshot.SnapshotId,
        };
        await ec2.deleteSnapshot(deleteSnapshotParams).promise();
        console.log(`Deleted stale snapshot: ${snapshot.SnapshotId}`);
      }
    }

    return "Stale snapshots deleted successfully.";
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
