import React from 'react';
import classNames from 'classnames';

import { navigateWithinEnv } from 'lib/utils/query-string';

import { QuerySnippetNavigator } from 'components/QuerySnippetNavigator/QuerySnippetNavigator';
import { DataDocSchemaNavigator } from 'components/DataDocSchemaNavigator/DataDocSchemaNavigator';
import { QueryViewNavigator } from 'components/QueryViewNavigator/QueryViewNavigator';
import { DataDocNavigator } from 'components/DataDocNavigator/DataDocNavigator';
import { Sidebar } from 'ui/Sidebar/Sidebar';
import { Icon } from 'ui/Icon/Icon';

import { Entity } from './types';
import { EnvironmentTopbar } from './EnvironmentTopbar';
import { EntitySidebar } from './EntitySidebar';
import './EnvironmentAppSidebar.scss';
import { EnvironmentDropdownButton } from './EnvironmentDropdownButton';
import { BoardNavigator } from 'components/BoardNavigator/BoardNavigator';
import { useEvent } from 'hooks/useEvent';
import { matchKeyPress } from 'lib/utils/keyboard';

const SIDEBAR_WIDTH = 320;

export const EnvironmentAppSidebar: React.FunctionComponent = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [entity, setEntity] = React.useState<Entity>('datadoc');

    const scrollToCollapseSidebar = React.useCallback(
        (event, direction, elementRef) => {
            if (
                direction === 'right' &&
                elementRef.clientWidth === SIDEBAR_WIDTH
            ) {
                const sidebarRect = elementRef.getBoundingClientRect();
                // this checks if mouse cursor is SIDEBAR_WIDTH / 2 left of sidebar
                if (
                    event instanceof MouseEvent &&
                    sidebarRect.left + sidebarRect.width - event.clientX >
                        SIDEBAR_WIDTH / 2
                ) {
                    setCollapsed(true);
                }
            }
        },
        []
    );

    const onCollapseKeyDown = React.useCallback(
        (evt) => {
            if (matchKeyPress(evt, 'Cmd-B')) {
                // command + B
                setCollapsed(!collapsed);
                evt.stopPropagation();
                evt.preventDefault();
            }
        },
        [collapsed]
    );

    useEvent('keydown', onCollapseKeyDown);

    let navigator: React.ReactNode;
    if (!collapsed) {
        navigator =
            entity === 'datadoc' ? (
                <DataDocNavigator />
            ) : entity === 'table' ? (
                <DataDocSchemaNavigator />
            ) : entity === 'board' ? (
                <BoardNavigator />
            ) : entity === 'snippet' ? (
                <QuerySnippetNavigator
                    onQuerySnippetSelect={(querySnippet) =>
                        navigateWithinEnv(
                            `/query_snippet/${querySnippet.id}/`,
                            {
                                isModal: true,
                            }
                        )
                    }
                />
            ) : entity === 'execution' ? (
                <QueryViewNavigator
                    onQueryExecutionClick={(queryExecution) =>
                        navigateWithinEnv(
                            `/query_execution/${queryExecution.id}/`,
                            {
                                isModal: true,
                            }
                        )
                    }
                />
            ) : (
                <div />
            );
    }

    const collapseButton = (
        <span
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-sidebar-button"
        >
            <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} />
        </span>
    );

    const environmentPickerSection = collapsed ? (
        <EnvironmentDropdownButton />
    ) : (
        <EnvironmentTopbar />
    );

    const contentDOM = (
        <>
            <div className="EnvironmentAppSidebar-content">
                <div className="sidebar-environment-picker">
                    {environmentPickerSection}
                </div>
                <div className="sidebar-content-main">
                    <EntitySidebar
                        selectedEntity={entity}
                        onSelectEntity={(e) => {
                            setCollapsed(false);
                            setEntity(e);
                        }}
                    />
                    <div className="sidebar-content-main-navigator">
                        {navigator}
                    </div>
                </div>
                {collapseButton}
            </div>
        </>
    );

    const className = classNames({
        EnvironmentAppSidebar: true,
        collapsed,
    });

    return collapsed ? (
        <div className={className}>{contentDOM}</div>
    ) : (
        <Sidebar
            className={className}
            initialWidth={SIDEBAR_WIDTH}
            minWidth={SIDEBAR_WIDTH}
            onResize={scrollToCollapseSidebar}
        >
            {contentDOM}
        </Sidebar>
    );
};
