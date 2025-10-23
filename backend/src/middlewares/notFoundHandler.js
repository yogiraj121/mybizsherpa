const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.originalUrl}`,
  });};

export default notFoundHandler;
