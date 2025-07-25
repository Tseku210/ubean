import { createClient } from '@sanity/client';

const sanityClient = createClient(
            {"apiVersion":"v2023-08-24","projectId":"ulqjwxud","dataset":"production","useCdn":true}
          );

globalThis.sanityClient = sanityClient;

export { sanityClient as s };
