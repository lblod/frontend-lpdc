/**
 * Removes the specified item from the array. This mutates the provided array and only removes the first occurence of the item.
 */
export function removeItem(array, itemToRemove) {
  const index = array.indexOf(itemToRemove);
  if (index !== -1) {
    array.splice(index, 1);
  }
}
