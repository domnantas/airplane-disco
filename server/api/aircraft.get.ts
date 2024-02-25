import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const coordinatesSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
  const { aircraftScatterApiKey } = useRuntimeConfig(event);
  const query = await getValidatedQuery(event, (query) =>
    coordinatesSchema.safeParse(query),
  );

  if (!query.success) {
    const validationError = fromZodError(query.error);

    throw createError({
      statusCode: 400,
      statusMessage: validationError.toString(),
    });
  }

  const { latitude, longitude } = query.data;

  const data = await $fetch(
    `https://aircraftscatter.p.rapidapi.com/lat/${latitude}/lon/${longitude}/`,
    {
      headers: {
        "X-RapidAPI-Key": aircraftScatterApiKey,
        "X-RapidAPI-Host": "aircraftscatter.p.rapidapi.com",
      },
    },
  );

  return data;
});
