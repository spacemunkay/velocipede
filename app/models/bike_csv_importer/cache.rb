# Helper module to create various cached instances for bike CSV imports
class BikeCsvImporter
  module Cache
    def cached_bike_purpose(purpose)
      @bike_purpose_cache           ||= {}
      @bike_purpose_cache[purpose]  ||= BikePurpose.find_by_purpose purpose
    end

    def cached_bike_brand(brand, new_if_empty = false)
      @bike_brand_cache ||= {}
      if @bike_brand_cache.has_key? brand
        @bike_brand_cache[brand]
      else
        bike_brand   = BikeBrand.where('lower(brand) = ?', brand.downcase).first
        bike_brand ||= BikeBrand.new(brand: brand) if new_if_empty

        @bike_brand_cache[brand] = bike_brand
      end
    end

    def cached_bike_model(model)
      @bike_model_cache ||= {}
      if @bike_model_cache.has_key? model
        @bike_model_cache[model]
      else
        @bike_model_cache[model] = BikeModel.where('lower(model) = ?', model.downcase).first
      end
    end

    def cached_log_bike_action(action)
      @log_bike_action_id_cache         ||= {}
      @log_bike_action_id_cache[action] ||= ActsAsLoggable::BikeAction.find_by_action(action)
    end
  end
end
