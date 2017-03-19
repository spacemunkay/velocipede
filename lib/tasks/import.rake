namespace :import do
  namespace :bikes do
    # Imports bikes info from CSV file
    task :csv, [:file, :dry_run] => :environment do |t, args|
      file, dry_run = args.values_at :file, :dry_run
      next puts "Usage: rake #{t.name}[$csv_file_path[,$dry_run=dry]]" unless file
      next puts "File #{file} does not exist or is unreachable" unless File.readable? file
      pp BikeCsvImporter.new(file, dry_run == 'dry').run
    end

    # Analyze a single field from CSV file
    task :analyze_csv, [:file, :field] => :environment do |t, args|
      file, field = args.values_at :file, :field
      next puts "Usage: rake #{t.name}[$csv_file_path[,\"$field_name\"]]" unless file
      next puts "File #{file} does not exist or is unreachable" unless File.readable? file
      pp BikeCsvImporter.new(file).analyze field ? [field] : []
    end
  end
end