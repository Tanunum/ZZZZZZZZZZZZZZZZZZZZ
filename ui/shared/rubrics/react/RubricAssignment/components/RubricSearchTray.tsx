/*
 * Copyright (C) 2024 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useEffect, useState} from 'react'
import {Tray} from '@instructure/ui-tray'
import {View} from '@instructure/ui-view'
import {Flex} from '@instructure/ui-flex'
import {Button, CloseButton} from '@instructure/ui-buttons'
import {Heading} from '@instructure/ui-heading'
import LoadingIndicator from '@canvas/loading-indicator'
import {useScope as useI18nScope} from '@canvas/i18n'
import {TextInput} from '@instructure/ui-text-input'
import {IconAddLine, IconArrowOpenEndLine, IconSearchLine} from '@instructure/ui-icons'
import {Text} from '@instructure/ui-text'
import {useQuery} from '@canvas/query'
import {getGradingRubricContexts, getGradingRubricsForContext} from '../queries'
import {SimpleSelect} from '@instructure/ui-simple-select'
import {RadioInput} from '@instructure/ui-radio-input'
import type {GradingRubricContext} from '../types/rubricAssignment'
import type {Rubric} from '../../types/rubric'
import {possibleString} from '../../Points'
import {ScreenReaderContent} from '@instructure/ui-a11y-content'

const I18n = useI18nScope('enhanced-rubrics-assignment-search')

type RubricSearchTrayProps = {
  courseId: string
  isOpen: boolean
  onPreview: (rubric: Rubric) => void
  onDismiss: () => void
  onAddRubric: (rubricId?: string) => void
}
export const RubricSearchTray = ({
  courseId,
  isOpen,
  onPreview,
  onDismiss,
  onAddRubric,
}: RubricSearchTrayProps) => {
  const [search, setSearch] = useState<string>('')
  const [selectedContext, setSelectedContext] = useState<string>()
  const [selectedAssociationId, setSelectedAssociationId] = useState<string>()
  const [selectedRubricId, setSelectedRubricId] = useState<string>()

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedAssociationId(undefined)
      setSelectedRubricId(undefined)
    }
  }, [isOpen])

  const {data: rubricContexts = []} = useQuery({
    queryKey: [`fetch-grading-rubric-contexts-${courseId}`],
    queryFn: async () => getGradingRubricContexts(courseId),
    enabled: !!courseId,
    onSuccess: async successResponse => {
      setSelectedContext(successResponse[0]?.context_code)
    },
  })

  const {data: rubricsForContext = [], isLoading: isRubricsLoading} = useQuery({
    queryKey: ['fetch-grading-rubrics-for-context', courseId, selectedContext],
    queryFn: async () => getGradingRubricsForContext(courseId, selectedContext),
    enabled: !!courseId && !!selectedContext,
  })

  const contextPrefix = (contextCode: string) => {
    if (contextCode.startsWith('account_')) {
      return I18n.t('Account')
    } else if (contextCode.startsWith('course_')) {
      return I18n.t('Course')
    }

    return ''
  }

  const getContextName = (context: GradingRubricContext) => {
    return `${context.name} (${contextPrefix(context.context_code)})`
  }

  const handleChangeContext = (contextCode: string) => {
    setSelectedContext(contextCode)
    setSelectedAssociationId(undefined)
    setSelectedRubricId(undefined)
  }

  const filteredContextRubrics = rubricsForContext?.filter(({rubric}) =>
    rubric.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Tray
      label={I18n.t('Rubric Search Tray')}
      open={isOpen}
      onDismiss={onDismiss}
      size="small"
      placement="end"
      shouldCloseOnDocumentClick={true}
    >
      <View as="div" padding="medium" data-testid="rubric-search-tray">
        <Flex>
          <Flex.Item shouldGrow={true} shouldShrink={true}>
            <Heading level="h3">{I18n.t('Find Rubric')}</Heading>
          </Flex.Item>
          <Flex.Item>
            <CloseButton
              placement="end"
              offset="small"
              screenReaderLabel={I18n.t('Close')}
              onClick={onDismiss}
            />
          </Flex.Item>
        </Flex>
      </View>

      <View as="div" margin="x-small 0 0" padding="0 small">
        <TextInput
          autoComplete="off"
          renderLabel={<ScreenReaderContent>{I18n.t('search rubrics input')}</ScreenReaderContent>}
          placeholder={I18n.t('Search rubrics')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          renderAfterInput={() => <IconSearchLine inline={false} />}
        />
      </View>

      {!rubricContexts ? (
        <LoadingIndicator />
      ) : (
        <View as="div" margin="medium 0 0" padding="0 small">
          <SimpleSelect
            renderLabel={
              <ScreenReaderContent>{I18n.t('select account or course')}</ScreenReaderContent>
            }
            value={selectedContext}
            onChange={(_, {value}) => handleChangeContext(value as string)}
            data-testid="rubric-context-select"
          >
            {rubricContexts.map(context => (
              <SimpleSelect.Option
                key={context.context_code}
                id={`opt-${context.context_code}`}
                value={context.context_code}
              >
                {getContextName(context)}
              </SimpleSelect.Option>
            ))}
          </SimpleSelect>

          <View
            as="div"
            margin="small 0 0"
            height="100vh"
            maxHeight="calc(100vh - 272px)"
            padding="small 0"
            overflowY="auto"
          >
            {isRubricsLoading ? (
              <LoadingIndicator />
            ) : (
              filteredContextRubrics?.map(({rubricAssociationId, rubric}) => (
                <RubricSearchRow
                  key={rubricAssociationId}
                  rubric={rubric}
                  checked={rubricAssociationId === selectedAssociationId}
                  onPreview={onPreview}
                  onSelect={() => {
                    setSelectedAssociationId(rubricAssociationId)
                    setSelectedRubricId(rubric.id)
                  }}
                />
              ))
            )}
          </View>
        </View>
      )}

      <View as="footer" margin="small 0 0" height="62px">
        <View as="hr" margin="0" />
        <RubricSearchFooter
          disabled={!selectedRubricId}
          onSubmit={() => onAddRubric(selectedRubricId)}
          onCancel={onDismiss}
        />
      </View>
    </Tray>
  )
}

type RubricSearchRowProps = {
  checked: boolean
  rubric: Rubric
  onPreview: (rubric: Rubric) => void
  onSelect: () => void
}
const RubricSearchRow = ({checked, rubric, onPreview, onSelect}: RubricSearchRowProps) => {
  return (
    <View as="div" margin="medium 0 0">
      <Flex>
        <Flex.Item align="start" margin="xxx-small 0 0">
          <RadioInput
            label={
              <ScreenReaderContent>
                {I18n.t('select %{title}', {title: rubric.title})}
              </ScreenReaderContent>
            }
            onChange={onSelect}
            checked={checked}
          />
        </Flex.Item>
        <Flex.Item shouldGrow={true} align="start" margin="0 0 0 xx-small">
          <View as="div">
            <Text data-testid="rubric-search-row-title">{rubric.title}</Text>
          </View>
          <View as="div">
            <Text size="small" data-testid="rubric-search-row-data">
              {possibleString(rubric.pointsPossible)} | {rubric.criteriaCount} {I18n.t('criterion')}
            </Text>
          </View>
        </Flex.Item>
        <Flex.Item align="start">
          <IconArrowOpenEndLine
            data-testid="rubric-preview-btn"
            onClick={() => onPreview(rubric)}
            style={{cursor: 'pointer'}}
          />
        </Flex.Item>
      </Flex>
      <View as="hr" margin="medium 0 0" />
    </View>
  )
}

type RubricSearchFooterProps = {
  disabled: boolean
  onSubmit: () => void
  onCancel: () => void
}
const RubricSearchFooter = ({disabled, onSubmit, onCancel}: RubricSearchFooterProps) => {
  return (
    <View
      as="div"
      data-testid="rubric-assessment-footer"
      overflowX="hidden"
      overflowY="hidden"
      background="secondary"
      padding="0 small"
    >
      <Flex justifyItems="end" margin="small 0">
        <Flex.Item margin="0 small 0 0">
          <Button
            color="secondary"
            onClick={() => onCancel()}
            data-testid="cancel-rubric-search-button"
          >
            {I18n.t('Cancel')}
          </Button>
        </Flex.Item>
        <Flex.Item>
          <Button
            color="primary"
            renderIcon={IconAddLine}
            onClick={() => onSubmit()}
            data-testid="save-rubric-assessment-button"
            disabled={disabled}
          >
            {I18n.t('Add')}
          </Button>
        </Flex.Item>
      </Flex>
    </View>
  )
}
