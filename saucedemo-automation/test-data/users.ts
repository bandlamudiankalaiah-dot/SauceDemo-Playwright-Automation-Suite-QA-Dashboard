/**
 * Reusable test data and credentials for SauceDemo automation tests.
 * Keeps test data decoupled from test execution and assertion logic.
 */

export interface TestUser {
  username: string;
  password: string;
  description: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
    description: 'Standard active customer with valid credentials',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
    description: 'User locked out of account',
  },
  problem: {
    username: 'problem_user',
    password: 'secret_sauce',
    description: 'User encountering UI rendering glitches',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
    description: 'User experiencing server/response delays',
  },
  invalidCredentials: {
    username: 'invalid_qa_user',
    password: 'wrong_password_123',
    description: 'Non-existent credentials for negative testing',
  },
  emptyUsername: {
    username: '',
    password: 'secret_sauce',
    description: 'Missing username scenario',
  },
  emptyPassword: {
    username: 'standard_user',
    password: '',
    description: 'Missing password scenario',
  },
} as const;

export const ERROR_MESSAGES = {
  invalidLogin: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
} as const;

export const DEFAULT_CUSTOMER: CustomerInfo = {
  firstName: 'Jane',
  lastName: 'Tester',
  postalCode: '90210',
};

export const EXPECTED_PRODUCTS = [
  {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
    slug: 'sauce-labs-backpack',
  },
  {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
    slug: 'sauce-labs-bike-light',
  },
  {
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
    slug: 'sauce-labs-bolt-t-shirt',
  },
  {
    name: 'Sauce Labs Fleece Jacket',
    price: '$49.99',
    slug: 'sauce-labs-fleece-jacket',
  },
  {
    name: 'Sauce Labs Onesie',
    price: '$7.99',
    slug: 'sauce-labs-onesie',
  },
  {
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: '$15.99',
    slug: 'test.allthethings()-t-shirt-(red)',
  },
] as const;
