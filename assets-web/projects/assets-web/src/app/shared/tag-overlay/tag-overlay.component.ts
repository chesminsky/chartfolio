/* tslint:disable:no-any */

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

@Component({
  selector: 'anms-tag-overlay',
  templateUrl: './tag-overlay.component.html',
  styleUrls: ['./tag-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagOverlayComponent implements OnDestroy {
  @ViewChild('tagOverlay')
  tagOverlay: TemplateRef<any>;

  @Input()
  tags: string[];

  overlayRef: OverlayRef | null;

  constructor(public overlay: Overlay, public viewContainerRef: ViewContainerRef, private elRef: ElementRef) {}

  @HostListener('document:click')
  onClick() {
    this.close();
  }

  open(e: MouseEvent) {
    e.stopPropagation();
    if (this.overlayRef) {
      this.close();
      return;
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elRef)
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top'
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom'
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    this.overlayRef.attach(new TemplatePortal(this.tagOverlay, this.viewContainerRef));
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  ngOnDestroy(): void {
    this.close();
  }
}
