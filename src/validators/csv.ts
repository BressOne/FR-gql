// Vintage,Product Name,Producer,Country,Region, ...rest

export const validateCSVRow = (row: Array<string | undefined>) => {
  //
  // disclaimer: this is a weak validation,
  // but i was noit going to add a heavy ajv,
  // yup or any other implementation fot the
  // sake of simplicity
  //

  const [rawVintage, productName, producerName, country, region] = row;
  const vintage = parseInt(rawVintage);

  const errorMessages = [];
  if (typeof vintage !== "number" || isNaN(vintage)) {
    const message = "malformed CSV entry: vintage is not a number";

    errorMessages.push(message);
  }
  if (typeof productName !== "string" || productName === "") {
    const message = "malformed CSV entry: Product Name is not a string";

    errorMessages.push(message);
  }
  if (typeof producerName !== "string" || producerName === "") {
    const message = "malformed CSV entry: Producer is not a string";
    errorMessages.push(message);
  }
  if (country && typeof country !== "string") {
    const message = "malformed CSV entry: country is not a string";
    errorMessages.push(message);
  }
  if (region && typeof region !== "string") {
    const message = "malformed CSV entry: region is not a string";
    errorMessages.push(message);
  }
  if (errorMessages.length) {
    console.error(errorMessages, row);
    return null;
  } else {
    return {
      vintage,
      productName,
      producerName,
      ...(country ? { country } : {}),
      ...(region ? { region } : {}),
    };
  }
};
