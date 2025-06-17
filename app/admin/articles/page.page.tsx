const handleContentChange = (index: number, field: keyof ArticleContentItem, value: any) => {
  const updatedContents = [...contents];
  if (updatedContents[index]) {
    // Create a new object for the specific content block being updated
    updatedContents[index] = {
      ...updatedContents[index],
      [field]: value,
    };
  }
  setContents(updatedContents);
};

const handleRemoveContent = (index: number) => {
  // ... existing code ...
}; 