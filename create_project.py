import os
import json

def create_project(project_id, title, heading, subheading):
    # Define paths
    media_path = os.path.join("media", project_id)
    project_file = os.path.join("projects", f"{project_id}.json")

    # Create media directory
    os.makedirs(media_path, exist_ok=True)

    # Create JSON data
    project_data = {
        "title": title,
        "heading": heading,
        "subheading": subheading,
        "image": f"{media_path}/project.jpg",
        "brochure": f"{media_path}/brochure.pdf"
    }

    # Write JSON file
    with open(project_file, 'w') as f:
        json.dump(project_data, f, indent=2)

    print(f"Project {project_id} created successfully.")

# Example usage
create_project("102", "Azure", "Downtown Dubai", "Experience Urban Living: Apartments Starting at AED 1,200,000*")
