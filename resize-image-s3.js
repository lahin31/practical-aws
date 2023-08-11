// this lambda function will resize the image with sharp and save it to s3 bucket

const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const sharp = require("sharp");

exports.handler = async (event, context) => {
  try {
    // Get the S3 bucket and object key from the event
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;

    // Fetch the object from the source bucket
    const getObjectParams = {
      Bucket: bucket,
      Key: key,
    };
    const originalObject = await S3.getObject(getObjectParams).promise();

    // Resize the image using Sharp
    const resizedImage = await sharp(originalObject.Body)
      .resize({ width: 300, height: 300 })
      .toBuffer();

    // Upload the resized image to the destination bucket
    const putObjectParams = {
      Bucket: "destination-bucket", // Replace with your destination bucket name
      Key: `resized/${key}`,
      Body: resizedImage,
      ContentType: "image/jpeg", // Modify as needed
    };
    await S3.putObject(putObjectParams).promise();

    return "Image resized and uploaded successfully.";
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
