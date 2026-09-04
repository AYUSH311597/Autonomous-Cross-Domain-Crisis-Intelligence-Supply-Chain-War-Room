# -----------------------------------------------------------------------------
# 1. VPC & Networking Architecture
# -----------------------------------------------------------------------------
resource "aws_vpc" "cascadia_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "cascadia-vpc-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "cascadia_igw" {
  vpc_id = aws_vpc.cascadia_vpc.id

  tags = {
    Name = "cascadia-igw-${var.environment}"
  }
}

resource "aws_subnet" "cascadia_public_subnet" {
  vpc_id                  = aws_vpc.cascadia_vpc.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "cascadia-public-subnet-${var.environment}"
  }
}

resource "aws_route_table" "cascadia_public_rt" {
  vpc_id = aws_vpc.cascadia_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.cascadia_igw.id
  }

  tags = {
    Name = "cascadia-public-rt-${var.environment}"
  }
}

resource "aws_route_table_association" "cascadia_public_assoc" {
  subnet_id      = aws_subnet.cascadia_public_subnet.id
  route_table_id = aws_route_table.cascadia_public_rt.id
}

# -----------------------------------------------------------------------------
# 2. Security Group (Firewall Rules)
# -----------------------------------------------------------------------------
resource "aws_security_group" "cascadia_sg" {
  name        = "cascadia-security-group-${var.environment}"
  description = "Allow inbound SSH, HTTP, App, and Jenkins traffic"
  vpc_id      = aws_vpc.cascadia_vpc.id

  # SSH Access
  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Standard Web Traffic
  ingress {
    description = "HTTP Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # CASCADIA Application Access
  ingress {
    description = "CASCADIA Application Port"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Jenkins CI/CD Controller Port
  ingress {
    description = "Jenkins CI/CD Server"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound Rule (Allow All)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cascadia-sg-${var.environment}"
  }
}

# -----------------------------------------------------------------------------
# 3. Dynamic Ubuntu 22.04 LTS AMI Lookup
# -----------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# -----------------------------------------------------------------------------
# 4. EC2 Compute Node
# -----------------------------------------------------------------------------
resource "aws_instance" "cascadia_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.cascadia_public_subnet.id
  vpc_security_group_ids = [aws_security_group.cascadia_sg.id]
  key_name               = var.key_name

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg lsb-release
              mkdir -p /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io
              usermod -aG docker ubuntu
              systemctl enable docker
              systemctl start docker
              EOF

  tags = {
    Name        = "cascadia-server-${var.environment}"
    Environment = var.environment
  }
}

# -----------------------------------------------------------------------------
# 5. Output Parameters
# -----------------------------------------------------------------------------
output "public_ip" {
  description = "Public IP address of the provisioned EC2 instance"
  value       = aws_instance.cascadia_server.public_ip
}

output "application_url" {
  description = "Direct Application URL"
  value       = "http://${aws_instance.cascadia_server.public_ip}:8081"
}