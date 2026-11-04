import { timeout } from 'ember-concurrency';
import { STATUS } from 'frontend-lpdc/models/remote-data-object';

const MAX_ATTEMPTS = 15; //TODO:find sweet spot of retries, align with download service

/**
 * Polls the remote url until the download-url-service finished downloading it and returns the downloaded file.
 *
 * This is the file on disk (share://) the download-url-service created, downloads don't get a separate logical file.
 * The service creates it before setting the status to success, so it's available as soon as the download succeeded.
 */
export async function waitForDownload(remoteDataObject) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await timeout(1000);
    await remoteDataObject.reload();

    if (remoteDataObject.status === STATUS.SUCCESS) {
      // reload: the relationship was still empty when the remote data object was created
      return await remoteDataObject.belongsTo('file').reload();
    }
    if (remoteDataObject.status === STATUS.FAILED) {
      throw new Error(`Download mislukt: ${remoteDataObject.source}`);
    }
  }

  throw new Error(`Download duurt te lang: ${remoteDataObject.source}`);
}
