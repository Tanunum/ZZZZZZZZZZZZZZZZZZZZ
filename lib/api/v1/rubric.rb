# frozen_string_literal: true

#
# Copyright (C) 2016 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.
#

module Api::V1::Rubric
  include Api::V1::Json
  include Api::V1::RubricAssessment
  include Api::V1::RubricAssociation

  API_ALLOWED_RUBRIC_OUTPUT_FIELDS = {
    only: %w[
      id
      title
      context_id
      context_type
      points_possible
      reusable
      public
      read_only
      free_form_criterion_comments
      hide_score_total
      data
      rating_order
    ]
  }.freeze

  def rubrics_json(rubrics, user, session, opts = {})
    rubrics.map { |r| rubric_json(r, user, session, opts) }
  end

  def rubric_json(rubric, user, session, opts = {})
    json_attributes = API_ALLOWED_RUBRIC_OUTPUT_FIELDS
    hash = api_json(rubric, user, session, json_attributes)
    hash["criteria"] = rubric.data if opts[:style] == "full"
    hash["assessments"] = rubric_assessments_json(opts[:assessments], user, session, opts) unless opts[:assessments].nil?
    hash["associations"] = rubric_associations_json(opts[:associations], user, session, opts) unless opts[:associations].nil?
    hash
  end

  def rubric_pagination_url
    if @context.is_a? Course
      api_v1_course_rubrics_url(@context)
    else
      api_v1_account_rubrics_url(@context)
    end
  end

  def rubric_used_locations_pagination_url(rubric)
    if @context.is_a? Course
      api_v1_rubrics_course_used_locations_path(
        course_id: @context.id, id: rubric.id, include_host: true
      )
    else
      api_v1_rubrics_account_used_locations_path(
        account_id: @context.id, id: rubric.id, include_host: true
      )
    end
  end
end
