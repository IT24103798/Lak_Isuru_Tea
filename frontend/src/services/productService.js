import { apiRequest } from "../api/api";

export const getAllProducts = async () => {
  return apiRequest("/products");
};

export const getProductById = async (id) => {
  return apiRequest(`/products/${id}`);
};

export const createProduct = async (product) => {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
};

export const updateProduct = async (id, product) => {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
};

export const deleteProduct = async (id) => {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
};

export const addProductReview = async (id, review) => {
  return apiRequest(`/products/${id}/reviews`, {
    method: "POST",
    body: JSON.stringify(review),
  });
};

export const getReviewEligibility = async (id) => {
  return apiRequest(`/products/${id}/review-eligibility`);
};

export const updateProductReview = async (productId, reviewId, review) => {
  return apiRequest(`/products/${productId}/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(review),
  });
};

export const deleteProductReview = async (productId, reviewId) => {
  return apiRequest(`/products/${productId}/reviews/${reviewId}`, {
    method: "DELETE",
  });
};
