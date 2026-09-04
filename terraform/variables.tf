variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the CASCADIA VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "key_name" {
  description = "Name of the AWS Key Pair for SSH access"
  type        = string
  default     = "cascadia-key"
}

variable "instance_type" {
  description = "EC2 Instance type for running Docker & Jenkins"
  type        = string
  default     = "t2.micro"
}